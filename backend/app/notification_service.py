"""
Notification Service — sends alerts to AWS SNS, SMTP Email, or demo mode.
"""
import os
import json
import logging
import smtplib
from email.message import EmailMessage
from datetime import datetime

logger = logging.getLogger(__name__)

# Attempt to import boto3
try:
    import boto3
    BOTO3_AVAILABLE = True
except ImportError:
    BOTO3_AVAILABLE = False
    logger.warning("boto3 not installed. SNS unavailable.")


class NotificationService:
    def __init__(self):
        self.sns_topic_arn = os.getenv("AWS_SNS_TOPIC_ARN", "")
        self.aws_region = os.getenv("AWS_DEFAULT_REGION", "us-east-1")
        
        # SMTP Config
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", 587))
        self.smtp_username = os.getenv("SMTP_USERNAME", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.smtp_recipient = os.getenv("SMTP_RECIPIENT", "")
        
        self.demo_mode = True
        self.connected_sns = False
        self.connected_smtp = False
        self.sns_client = None

        self._init_aws()
        self._init_smtp()
        
        if self.connected_sns or self.connected_smtp:
            self.demo_mode = False

    def _init_aws(self):
        if not BOTO3_AVAILABLE or not self.sns_topic_arn:
            return

        try:
            self.sns_client = boto3.client("sns", region_name=self.aws_region)
            self.sns_client.get_topic_attributes(TopicArn=self.sns_topic_arn)
            self.connected_sns = True
            logger.info("AWS SNS connected successfully.")
        except Exception as e:
            logger.warning(f"AWS SNS connection failed: {e}")

    def _init_smtp(self):
        if self.smtp_username and self.smtp_password and self.smtp_recipient:
            try:
                server = smtplib.SMTP(self.smtp_server, self.smtp_port)
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.quit()
                self.connected_smtp = True
                logger.info("SMTP configured and connected successfully.")
            except Exception as e:
                logger.warning(f"SMTP connection failed: {e}")

    def get_status(self) -> dict:
        provider = "SMTP + SNS" if (self.connected_sns and self.connected_smtp) else "AWS SNS" if self.connected_sns else "SMTP" if self.connected_smtp else "AWS SNS"
        return {
            "provider": provider,
            "mode": "demo" if self.demo_mode else "connected",
            "connected": not self.demo_mode,
            "topic_arn": self.sns_topic_arn if not self.demo_mode else None,
        }

    async def send_alert(self, alert: dict) -> dict:
        """Send an alert notification."""
        if self.demo_mode:
            return await self._demo_notify(alert)

        results = {}
        if self.connected_sns:
            try:
                results = await self._sns_notify(alert)
            except Exception as e:
                logger.error(f"SNS send failed: {e}")
                
        if self.connected_smtp:
            try:
                results = await self._smtp_notify(alert)
            except Exception as e:
                logger.error(f"SMTP send failed: {e}")

        if not results:
            return await self._demo_notify(alert)
        return results

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

    async def _smtp_notify(self, alert: dict) -> dict:
        msg = EmailMessage()
        msg.set_content(self._format_email(alert))
        msg["Subject"] = f"[ACENTRA SENTINEL] {alert.get('severity', 'ALERT')}: {alert.get('service_display', 'Unknown Service')}"
        msg["From"] = f"Acentra Sentinel <{self.smtp_username}>"
        msg["To"] = self.smtp_recipient

        server = smtplib.SMTP(self.smtp_server, self.smtp_port)
        server.starttls()
        server.login(self.smtp_username, self.smtp_password)
        server.send_message(msg)
        server.quit()
        logger.info(f"SMTP Email sent to {self.smtp_recipient}")
        
        return {
            "status": "sent",
            "message_id": f"smtp-{datetime.now().strftime('%H%M%S')}",
            "provider": "SMTP",
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
