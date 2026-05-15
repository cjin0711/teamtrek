export const formatTripDate = (dateValue) => {
    if (!dateValue) {
        return '';
    }

    const dateString = String(dateValue).split('T')[0];
    const [year, month, day] = dateString.split('-');

    if (!year || !month || !day) {
        return '';
    }

    return `${Number(month)}/${Number(day)}/${year}`;
};
