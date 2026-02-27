from models import db, DeliveryHistory
from datetime import datetime

class TrackingService:
    """Service for reliable operational transparency across the platform."""

    @staticmethod
    def log_delivery(photo_id, medium, recipient, status="Sent"):
        """
        Logs completed deliveries with medium, timestamp, and recipient details.
        """
        try:
            entry = DeliveryHistory(
                photo_id=photo_id,
                delivery_type=medium, # 'Email' or 'WhatsApp'
                recipient=recipient,
                status=status,
                timestamp=datetime.utcnow()
            )
            db.session.add(entry)
            db.session.commit()
            return True
        except Exception as e:
            print(f"Tracking Log Error: {e}")
            return False