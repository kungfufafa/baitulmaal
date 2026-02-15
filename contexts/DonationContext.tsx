import { Donation } from '@/types';
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

interface DonationContextType {
    donations: Donation[];
    addDonation: (donation: Donation) => void;
}

const DonationContext = createContext<DonationContextType | undefined>(undefined);

export function DonationProvider({ children }: { children: React.ReactNode }) {
    const [donations, setDonations] = useState<Donation[]>([]);

    const addDonation = useCallback((donation: Donation) => {
        setDonations((prev) => [donation, ...prev].slice(0, 100));
    }, []);

    const contextValue = useMemo(() => ({
        donations,
        addDonation,
    }), [donations, addDonation]);

    return (
        <DonationContext.Provider value={contextValue}>
            {children}
        </DonationContext.Provider>
    );
}

export function useDonations() {
    const context = useContext(DonationContext);
    if (context === undefined) {
        throw new Error('useDonations must be used within a DonationProvider');
    }
    return context;
}
