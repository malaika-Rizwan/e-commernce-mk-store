'use client';

import { Input } from '@/components/ui/Input';
import type { ShippingAddressInput } from '@/lib/validations/checkout';

interface ShippingAddressFormProps {
  value: ShippingAddressInput;
  onChange: (data: ShippingAddressInput) => void;
  errors?: Partial<Record<keyof ShippingAddressInput, string>>;
}

const defaultAddress: ShippingAddressInput = {
  fullName: '',
  address: '',
  city: '',
  postalCode: '',
  country: '',
  phone: '',
};

export function ShippingAddressForm({
  value,
  onChange,
  errors = {},
}: ShippingAddressFormProps) {
  const data = { ...defaultAddress, ...value };

  return (
    <div className="space-y-4">
      <Input
        label="Full name"
        value={data.fullName}
        onChange={(e) => onChange({ ...data, fullName: e.target.value })}
        error={errors.fullName}
        required
        autoComplete="name"
      />
      <Input
        label="Address"
        value={data.address}
        onChange={(e) => onChange({ ...data, address: e.target.value })}
        error={errors.address}
        required
        autoComplete="street-address"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="City"
          value={data.city}
          onChange={(e) => onChange({ ...data, city: e.target.value })}
          error={errors.city}
          required
          autoComplete="address-level2"
        />
        <Input
          label="Postal code"
          value={data.postalCode}
          onChange={(e) => onChange({ ...data, postalCode: e.target.value })}
          error={errors.postalCode}
          required
          autoComplete="postal-code"
        />
      </div>
      <Input
        label="Country"
        value={data.country}
        onChange={(e) => onChange({ ...data, country: e.target.value })}
        error={errors.country}
        required
        autoComplete="country-name"
      />
      <Input
        label="Phone"
        type="tel"
        value={data.phone ?? ''}
        onChange={(e) => onChange({ ...data, phone: e.target.value })}
        error={errors.phone}
        required
        autoComplete="tel"
      />
    </div>
  );
}
