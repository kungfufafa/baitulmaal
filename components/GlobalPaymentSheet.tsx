import PaymentModal from '@/components/modals/PaymentModal';
import { useDonations } from '@/contexts/DonationContext';
import { usePaymentSheet } from '@/contexts/PaymentSheetContext';
import { BankType, Donation, PaymentType, PaymentMethod } from '@/types';

export default function GlobalPaymentSheet() {
    const { isOpen, category, closePaymentSheet } = usePaymentSheet();
    const { addDonation, donations } = useDonations();

    const handleConfirmPayment = (amount: number, paymentType: PaymentType, method: PaymentMethod) => {
        if (donations.length >= 999) {
            console.warn('Max donations reached');
            return;
        }

        const newDonation: Donation = {
            id: Date.now().toString(),
            type: 'donation',
            category: category,
            paymentType,
            amount,
            paymentMethodId: method.id,
            paymentMethod: method,
            bank: method.type === 'bank' ? (method.id.includes('bsi') ? 'bsi' : method.id.includes('mandiri') ? 'mandiri' : 'bni') : 'bsi',
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
