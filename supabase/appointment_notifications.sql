-- Create function to handle appointment status changes
CREATE OR REPLACE FUNCTION handle_appointment_status_change()
RETURNS TRIGGER AS $$
DECLARE
    notification_title TEXT;
    notification_message TEXT;
    notification_type TEXT;
    patient_name TEXT;
    doctor_name TEXT;
    appt_time TEXT;
BEGIN
    -- Only proceed if status has changed
    IF NEW.status = OLD.status THEN
        RETURN NEW;
    END IF;

    -- Fetch names for better messages (optional but nice)
    -- Since this runs on the server, we can query other tables if needed, 
    -- but for simplicity and performance, we'll keep messages key-info focused.
    
    appt_time := to_char(NEW.start_time, 'Day, DD Mon HH12:MI AM');

    -- Define message based on new status
    IF NEW.status = 'confirmed' THEN
        notification_title := 'Appointment Confirmed';
        notification_message := 'Your appointment on ' || appt_time || ' has been confirmed.';
        notification_type := 'success';
    ELSIF NEW.status = 'cancelled' THEN
        notification_title := 'Appointment Cancelled';
        notification_message := 'Your appointment on ' || appt_time || ' has been cancelled.';
        notification_type := 'error';
    ELSIF NEW.status = 'completed' THEN
        notification_title := 'Appointment Completed';
        notification_message := 'Your appointment on ' || appt_time || ' has been marked as completed.';
        notification_type := 'info';
    ELSE
        -- No notification for other status changes (like pending)
        RETURN NEW;
    END IF;

    -- Insert notification for the patient
    INSERT INTO notifications (user_id, title, message, type, meta)
    VALUES (
        NEW.patient_id,
        notification_title,
        notification_message,
        notification_type,
        jsonb_build_object('appointment_id', NEW.id, 'status', NEW.status)
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to allow re-running this script
DROP TRIGGER IF EXISTS on_appointment_status_change ON appointments;

-- Create trigger
CREATE TRIGGER on_appointment_status_change
    AFTER UPDATE ON appointments
    FOR EACH ROW
    EXECUTE PROCEDURE handle_appointment_status_change();
