import { PaymentCategory } from '@/types';
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

interface PaymentSheetContextType {
    isOpen: boolean;
    category: PaymentCategory;
    openPaymentSheet: (category: PaymentCategory) => void;
    closePaymentSheet: () => void;
}

const PaymentSheetContext = createContext<PaymentSheetContextType | undefined>(undefined);

export function PaymentSheetProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [category, setCategory] = useState<PaymentCategory>('zakat');

    const openPaymentSheet = useCallback((cat: PaymentCategory) => {
        setCategory(cat);
        setIsOpen(true);
    }, []);

    const closePaymentSheet = useCallback(() => {
        setIsOpen(false);
    }, []);

    const contextValue = useMemo(() => ({
        isOpen,
        category,
        openPaymentSheet,
        closePaymentSheet,
    }), [isOpen, category, openPaymentSheet, closePaymentSheet]);

    return (
        <PaymentSheetContext.Provider value={contextValue}>
            {children}
        </PaymentSheetContext.Provider>
    );
}

export function usePaymentSheet() {
    const context = useContext(PaymentSheetContext);
    if (context === undefined) {
        throw new Error('usePaymentSheet must be used within a PaymentSheetProvider');
    }
    return context;
}
