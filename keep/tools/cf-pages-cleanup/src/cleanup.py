#!/usr/bin/env python3
"""Cloudflare Pages 배포 정리 도구

최신 배포를 제외한 나머지 배포를 삭제합니다.
Cloudflare API를 직접 사용합니다.
"""

import argparse
import os
import sys
from pathlib import Path

import httpx
from dotenv import load_dotenv

# Cloudflare API 기본 URL
CF_API_BASE = "https://api.cloudflare.com/client/v4"


def get_config() -> tuple[str, str]:
    """환경변수에서 Cloudflare 설정을 가져옵니다."""
    api_token = os.getenv("CLOUDFLARE_API_TOKEN")
    account_id = os.getenv("CLOUDFLARE_ACCOUNT_ID")

    if not api_token:
        print("오류: CLOUDFLARE_API_TOKEN 환경변수가 필요합니다.", file=sys.stderr)
        print("  .env 파일에 설정하거나 환경변수로 전달하세요.", file=sys.stderr)
        sys.exit(1)

    if not account_id:
        print("오류: CLOUDFLARE_ACCOUNT_ID 환경변수가 필요합니다.", file=sys.stderr)
        print("  .env 파일에 설정하거나 환경변수로 전달하세요.", file=sys.stderr)
        sys.exit(1)

    return api_token, account_id


def get_deployments(
    client: httpx.Client, account_id: str, project: str
) -> list[dict]:
    """프로젝트의 배포 목록을 조회합니다."""
    url = f"{CF_API_BASE}/accounts/{account_id}/pages/projects/{project}/deployments"

    response = client.get(url)

    if response.status_code != 200:
        print(f"오류: 배포 목록 조회 실패 (HTTP {response.status_code})", file=sys.stderr)
        print(response.text, file=sys.stderr)
        sys.exit(1)

    data = response.json()
    if not data.get("success"):
        print(f"오류: API 응답 실패", file=sys.stderr)
        print(data.get("errors", []), file=sys.stderr)
        sys.exit(1)

    return data.get("result", [])


def delete_deployment(
    client: httpx.Client, account_id: str, project: str, deployment_id: str
) -> tuple[bool, str]:
    """특정 배포를 삭제합니다."""
    url = (
        f"{CF_API_BASE}/accounts/{account_id}/pages/projects/{project}"
        f"/deployments/{deployment_id}"
    )

    response = client.delete(url)

    if response.status_code == 200:
        return True, ""

    # 에러 메시지 추출
    try:
        data = response.json()
        errors = data.get("errors", [])
        if errors:
            return False, errors[0].get("message", str(response.status_code))
    except Exception:
        pass

    return False, f"HTTP {response.status_code}"


def main() -> None:
    # .env 파일 로드 (스크립트 위치 기준)
    script_dir = Path(__file__).parent.parent
    env_file = script_dir / ".env"
    if env_file.exists():
        load_dotenv(env_file)

    parser = argparse.ArgumentParser(
        description="Cloudflare Pages 배포 정리 - 최신 배포를 제외한 나머지 삭제",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
사용 예시:
  %(prog)s nihotalk                    # 최신 1개 유지, 나머지 삭제
  %(prog)s nihotalk --dry-run          # 삭제될 목록만 확인
  %(prog)s nihotalk --keep 3           # 최신 3개 유지
  %(prog)s nihotalk --force            # 확인 없이 삭제

환경변수:
  CLOUDFLARE_API_TOKEN    Cloudflare API 토큰 (필수)
  CLOUDFLARE_ACCOUNT_ID   Cloudflare 계정 ID (필수)
        """,
    )
    parser.add_argument(
        "project",
        help="Cloudflare Pages 프로젝트명 (예: nihotalk, keepi)",
    )
    parser.add_argument(
        "--keep",
        type=int,
        default=1,
        help="유지할 최신 배포 개수 (기본값: 1)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="실제 삭제 없이 삭제될 목록만 출력",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="확인 없이 바로 삭제",
    )

    args = parser.parse_args()

    # 설정 로드
    api_token, account_id = get_config()

    # HTTP 클라이언트 생성
    headers = {
        "Authorization": f"Bearer {api_token}",
        "Content-Type": "application/json",
    }

    with httpx.Client(headers=headers, timeout=30.0) as client:
        # 배포 목록 조회
        print(f"프로젝트 '{args.project}'의 배포 목록을 조회합니다...")
        deployments = get_deployments(client, account_id, args.project)

        if not deployments:
            print("배포가 없습니다.")
            return

        print(f"총 {len(deployments)}개의 배포를 찾았습니다.")

        # 삭제 대상 결정 (최신순 정렬 가정)
        to_keep = deployments[:args.keep]
        to_delete = deployments[args.keep:]

        if not to_delete:
            print(f"삭제할 배포가 없습니다. (유지: {len(to_keep)}개)")
            return

        # 정보 출력
        print(f"\n유지할 배포 ({len(to_keep)}개):")
        for d in to_keep:
            print(f"  ✓ {d['id']}")

        print(f"\n삭제할 배포 ({len(to_delete)}개):")
        for d in to_delete:
            print(f"  ✗ {d['id']}")

        # dry-run 모드
        if args.dry_run:
            print("\n[DRY-RUN] 실제 삭제는 수행되지 않았습니다.")
            return

        # 확인
        if not args.force:
            print()
            confirm = input(f"{len(to_delete)}개의 배포를 삭제하시겠습니까? (y/N): ")
            if confirm.lower() != "y":
                print("취소되었습니다.")
                return

        # 삭제 실행
        print("\n삭제를 시작합니다...")
        success_count = 0
        fail_count = 0

        for d in to_delete:
            deployment_id = d["id"]
            print(f"  삭제 중: {deployment_id}...", end=" ", flush=True)

            success, error = delete_deployment(
                client, account_id, args.project, deployment_id
            )
            if success:
                print("완료")
                success_count += 1
            else:
                print(f"실패 ({error})")
                fail_count += 1

        # 결과 출력
        print(f"\n완료: 성공 {success_count}개, 실패 {fail_count}개")


if __name__ == "__main__":
    main()
