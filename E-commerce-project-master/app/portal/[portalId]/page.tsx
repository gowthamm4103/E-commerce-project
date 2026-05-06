'use client';

import { useParams } from 'next/navigation';
import { CartProvider } from '../../context/CartContext';
import CustomerPortalLanding from '../../components/CustomerPortalLanding';

export default function PortalPage() {
  const params = useParams();
  const portalId = params.portalId as string;

  return (
    <CartProvider>
      <CustomerPortalLanding portalUrl={portalId} />
    </CartProvider>
  );
}
