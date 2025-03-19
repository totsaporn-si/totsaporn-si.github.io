function createRTCDataForGenerateQRCode(rtcUniqueNo, rtcExpireDate) {
    const formattedExpireDate = formatRTCDateTime(rtcExpireDate);

    const rtcQRData = `01020307${rtcUniqueNo.length
        .toString()
        .padStart(2, "0")}${rtcUniqueNo}11${formattedExpireDate.length
            .toString()
            .padStart(2, "0")}${formattedExpireDate}`;

    return rtcQRData;
}

function formatRTCDateTime(dateTimeStr) {
    const date = new Date(dateTimeStr);
    if (isNaN(date.getTime())) {
        throw new Error(
            "Invalid date format (sample data 2025-01-25 23:59:59.999 +0700)"
        );
    }

    const pad = (num) => num.toString().padStart(2, "0");
    const DD = pad(date.getDate());
    const MM = pad(date.getMonth() + 1); // Month is zero-based
    const YYYY = date.getFullYear();
    const HH = pad(date.getHours());
    const mm = pad(date.getMinutes());
    const SS = pad(date.getSeconds());

    return `${DD}${MM}${YYYY}${HH}${mm}${SS}`;
}

window.createRTCDataForGenerateQRCode = createRTCDataForGenerateQRCode;
