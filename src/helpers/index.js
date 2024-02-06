export const getClientInformation = (information, t, template) => {
  const CLIENT_INFO_PLACEHOLDER = template || [
    { title: t('clientCodeClient'), value: '' },
    { title: t('clientFullName'), value: '' },
    { title: t('clientPhone'), value: '' },
    { title: t('clientAddress'), value: '' },
  ];

  if (information) {
    const info = [];
    const { name, last_name, otchestvo, address, phones, code, company } = information;

    if (CLIENT_INFO_PLACEHOLDER.some(({ title }) => title === t('clientCodeClient'))) {
      info.push({
        title: `${t('clientCodeClient')}: `,
        value: code,
      });
    }
    info.push({
      title: `${t('clientFullName')}: `,
      value: `${last_name} ${name} ${otchestvo || ''}`,
    });
    if (phones.length) {
      phones.forEach(({ country_code, number, phone_type_name }) => {
        info.push({
          title: `${t('clientPhone')}:`,
          value: `${(country_code || '') + number}`,
          valueEnd: `(${phone_type_name})`,
        });
      });
    }
    info.push({ title: `${t('clientAddress')}:`, value: address });
    if (CLIENT_INFO_PLACEHOLDER.some(({ title }) => title === t('clientCompany'))) {
      info.push({
        title: `${t('clientCompany')}: `,
        value: company,
      });
    }

    return info;
  }

  return template || CLIENT_INFO_PLACEHOLDER;
};

export const declOfNum = (n, text_forms) => {
  n = Math.abs(n) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) {
    return text_forms[2];
  }
  if (n1 > 1 && n1 < 5) {
    return text_forms[1];
  }
  if (n1 === 1) {
    return text_forms[0];
  }
  return text_forms[2];
};

export const uppercase = (str = '') => str.slice(0, 1).toUpperCase() + str.slice(1);
