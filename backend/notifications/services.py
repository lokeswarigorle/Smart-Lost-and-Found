import logging
from django.core.mail import send_mail
from django.conf import settings
from .models import Notification

logger = logging.getLogger(__name__)

def send_email_alert(recipient_email, subject, body):
    """Safely dispatches email alert using configured Django email backend."""
    if not recipient_email:
        return
    try:
        send_mail(
            subject=f"[Smart Lost & Found] {subject}",
            message=body,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@smartlostfound.local'),
            recipient_list=[recipient_email],
            fail_silently=True
        )
    except Exception as e:
        logger.warning(f"Email delivery skipped or encountered notice: {e}")

def create_notification(recipient, notification_type, title, message, link=None, send_email=True):
    """Creates in-app notification and optionally triggers email alert."""
    notification = Notification.objects.create(
        recipient=recipient,
        notification_type=notification_type,
        title=title,
        message=message,
        link=link
    )

    if send_email and recipient.email:
        send_email_alert(recipient.email, title, message)

    return notification

def create_match_notification(match_record):
    """Notifies both parties when a potential match is identified."""
    lost_user = match_record.lost_item.user
    found_user = match_record.found_item.finder

    # Notify Lost Item Owner
    title_owner = f"Potential AI Match Found for your '{match_record.lost_item.title}'!"
    msg_owner = (
        f"A found item '{match_record.found_item.title}' in {match_record.found_item.city} "
        f"has a {match_record.combined_score:.1f}% matching score with your reported item."
    )
    create_notification(
        recipient=lost_user,
        notification_type='match_found',
        title=title_owner,
        message=msg_owner,
        link=f"/matches"
    )

    # Notify Found Item Finder
    title_finder = f"Potential Match Identified for '{match_record.found_item.title}'"
    msg_finder = (
        f"Your found item in {match_record.found_item.city} resembles a lost item "
        f"'{match_record.lost_item.title}' reported by a user ({match_record.combined_score:.1f}% match)."
    )
    create_notification(
        recipient=found_user,
        notification_type='match_found',
        title=title_finder,
        message=msg_finder,
        link=f"/matches"
    )

def create_claim_notification(claim):
    """Notifies finder that an ownership claim was submitted."""
    finder = claim.found_item.finder
    title = f"New Ownership Claim for '{claim.found_item.title}'"
    message = (
        f"User '{claim.claimant.username}' has submitted an ownership claim for the item you found. "
        f"Claim ID: #{claim.id}."
    )
    create_notification(
        recipient=finder,
        notification_type='claim_received',
        title=title,
        message=message,
        link=f"/claims"
    )

def create_claim_decision_notification(claim, decision):
    """Notifies claimant about claim approval or rejection."""
    claimant = claim.claimant
    if decision == 'approved':
        title = f"Ownership Claim Approved: '{claim.found_item.title}'"
        message = (
            f"Congratulations! Your claim for '{claim.found_item.title}' has been APPROVED. "
            f"Safe handover instructions: {claim.admin_notes or 'Please contact the finder to arrange handover.'}"
        )
        notif_type = 'claim_approved'
    else:
        title = f"Ownership Claim Update: '{claim.found_item.title}'"
        message = (
            f"Your claim for '{claim.found_item.title}' was rejected. "
            f"Reason: {claim.admin_notes or 'Verification details did not match.'}"
        )
        notif_type = 'claim_rejected'

    create_notification(
        recipient=claimant,
        notification_type=notif_type,
        title=title,
        message=message,
        link=f"/claims"
    )
