'use client';

import { useParams } from 'next/navigation';
import { CartProvider } from '../../context/CartContext';
import TeamPortalLanding from '../../components/TeamPortalLanding';

export default function TeamPortalPage() {
  const params = useParams();
  const portalId = params.portalId as string;

  return (
    <CartProvider>
      <TeamPortalLanding portalUrl={portalId} />
    </CartProvider>
  );
}
