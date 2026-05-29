const priceFormat = (value: number) =>
  `${new Intl.NumberFormat('it-IT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}€`;

export { priceFormat };
