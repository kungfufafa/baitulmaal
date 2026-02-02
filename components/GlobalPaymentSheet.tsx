import PaymentModal from '@/components/modals/PaymentModal';
import { useDonations } from '@/contexts/DonationContext';
import { usePaymentSheet } from '@/contexts/PaymentSheetContext';
import { BankType, Donation, PaymentType } from '@/types';

export default function GlobalPaymentSheet() {
    const { isOpen, category, closePaymentSheet } = usePaymentSheet();
    const { addDonation, donations } = useDonations();

    const handleConfirmPayment = (amount: number, paymentType: PaymentType, bank: BankType) => {
        if (donations.length >= 999) {
            console.warn('Max donations reached');
            return;
        }

        const newDonation: Donation = {
            type: 'donation',
            category: category,
            paymentType,
            amount,
            bank,
            status: 'pending',
            createdAt: new Date().toISOString(),
            __backendId: Date.now().toString(),
        };

        addDonation(newDonation);
        closePaymentSheet();
    };

    return (
        <PaymentModal
            visible={isOpen}
            onClose={closePaymentSheet}
            category={category}
            onConfirm={handleConfirmPayment}
        />
    );
}
