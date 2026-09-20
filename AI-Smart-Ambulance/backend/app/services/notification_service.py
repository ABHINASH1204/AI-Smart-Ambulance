import logging

logger = logging.getLogger("notifications")


def notify_driver(driver_id: int, message: str) -> None:
    # Log-only for MVP. Swap in real SMS/push provider later without
    # touching any calling code.
    logger.info(f"[NOTIFY driver={driver_id}] {message}")


def notify_user(user_id: int, message: str) -> None:
    logger.info(f"[NOTIFY user={user_id}] {message}")
