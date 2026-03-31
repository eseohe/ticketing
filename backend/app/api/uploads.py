from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
import boto3
import os
import uuid

router = APIRouter()


class PresignRequest(BaseModel):
    filename: str
    content_type: str
    max_size: int = 10_485_760


@router.post("/uploads/sign")
async def sign_upload(payload: PresignRequest, request: Request):
    tenant_slug = getattr(request.state, "tenant_slug", None)
    if not tenant_slug:
        raise HTTPException(status_code=400, detail="Missing tenant context")

    bucket = os.environ.get("S3_BUCKET")
    if not bucket:
        raise HTTPException(status_code=500, detail="S3_BUCKET not configured")

    key = f"{tenant_slug}/{uuid.uuid4().hex}_{payload.filename}"

    s3 = boto3.client(
        "s3",
        aws_access_key_id=os.environ.get("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.environ.get("AWS_SECRET_ACCESS_KEY"),
        region_name=os.environ.get("AWS_REGION"),
    )

    try:
        presigned = s3.generate_presigned_post(
            Bucket=bucket,
            Key=key,
            Fields={"Content-Type": payload.content_type},
            Conditions=[["content-length-range", 1, payload.max_size], ["eq", "$Content-Type", payload.content_type]],
            ExpiresIn=3600,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate presigned url: {e}")

    return {"url": presigned["url"], "fields": presigned["fields"], "key": key}
