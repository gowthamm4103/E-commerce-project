'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { CartProvider } from '../../../context/CartContext';
import CustomerPortalLanding from '../../../components/CustomerPortalLanding';

export default function UserPortalPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const portalId = params.portalId as string;
  const directToLogin = searchParams.get('preview') === 'true';

  return (
    <CartProvider>
      <CustomerPortalLanding portalUrl={portalId} directToLogin={directToLogin} />
    </CartProvider>
  );
}
