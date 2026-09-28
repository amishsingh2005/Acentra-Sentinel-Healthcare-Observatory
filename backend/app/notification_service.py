"""
Notification Service — sends alerts to AWS SNS (or demo mode).
"""
import os
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

# Attempt to import boto3
try:
    import boto3
    BOTO3_AVAILABLE = True
except ImportError:
    BOTO3_AVAILABLE = False
    logger.warning("boto3 not installed. Running in demo notification mode.")


class NotificationService:
    def __init__(self):
        self.sns_topic_arn = os.getenv("AWS_SNS_TOPIC_ARN", "")
        self.aws_region = os.getenv("AWS_DEFAULT_REGION", "us-east-1")
        self.demo_mode = True
        self.connected = False
        self.sns_client = None

        self._init_aws()

    def _init_aws(self):
        if not BOTO3_AVAILABLE:
            logger.info("boto3 not available — running in demo notification mode.")
            return

        if not self.sns_topic_arn:
            logger.info("AWS_SNS_TOPIC_ARN not configured — running in demo notification mode.")
            return

        try:
            self.sns_client = boto3.client("sns", region_name=self.aws_region)
            # Test credentials
            self.sns_client.get_topic_attributes(TopicArn=self.sns_topic_arn)
            self.demo_mode = False
            self.connected = True
            logger.info("AWS SNS connected successfully.")
        except Exception as e:
            logger.warning(f"AWS SNS connection failed: {e}. Running in demo mode.")
            self.demo_mode = True
            self.connected = False

    def get_status(self) -> dict:
        return {
            "provider": "AWS SNS",
            "mode": "demo" if self.demo_mode else "connected",
            "connected": self.connected,
            "topic_arn": self.sns_topic_arn if not self.demo_mode else None,
        }

    async def send_alert(self, alert: dict) -> dict:
        """Send an alert notification. Falls back to demo mode gracefully."""
        if self.demo_mode or not self.sns_client:
            return await self._demo_notify(alert)

        try:
            return await self._sns_notify(alert)
        except Exception as e:
            logger.error(f"SNS send failed: {e}. Falling back to demo mode.")
            return await self._demo_notify(alert)

    async def _sns_notify(self, alert: dict) -> dict:
        message = {
            "default": json.dumps(alert),
            "email": self._format_email(alert),
        }

        response = self.sns_client.publish(
            TopicArn=self.sns_topic_arn,
            Message=json.dumps(message),
            MessageStructure="json",
            Subject=f"[ACENTRA SENTINEL] {alert.get('severity', 'ALERT')}: {alert.get('service_display', 'Unknown Service')}",
        )

        return {
            "status": "sent",
            "message_id": response.get("MessageId", "unknown"),
            "provider": "AWS SNS",
            "mode": "connected",
        }

    async def _demo_notify(self, alert: dict) -> dict:
        logger.info(
            f"[DEMO NOTIFICATION] {alert.get('severity')} alert for {alert.get('service_display')}: "
            f"Error rate {alert.get('current_rate')}% (baseline: {alert.get('baseline_rate')}%)"
        )
        return {
            "status": "demo_sent",
            "message_id": f"demo-{datetime.now().strftime('%H%M%S')}",
            "provider": "AWS SNS",
            "mode": "demo",
        }

    def _format_email(self, alert: dict) -> str:
        return (
            f"ACENTRA SENTINEL ALERT\n\n"
            f"Severity: {alert.get('severity')}\n"
            f"Service: {alert.get('service_display')}\n"
            f"Current Error Rate: {alert.get('current_rate')}%\n"
            f"Baseline: {alert.get('baseline_rate')}%\n"
            f"Deviation: +{alert.get('deviation_pct')}%\n"
            f"Detected At: {alert.get('detected_at')}\n\n"
            f"This is a synthetic demo alert from Acentra Sentinel.\n"
            f"No real PHI is contained in this message."
        )
