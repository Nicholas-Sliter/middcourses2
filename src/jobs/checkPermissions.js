


async function callPermissionsUpdate() {

    const INTERNAL_AUTH_TOKEN = process.env.INTERNAL_AUTH;
    const URL = process.env.NEXTAUTH_URL;

    const permissionsUrl = `${URL}/api/update/permissions`;
    const requestHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `${INTERNAL_AUTH_TOKEN}`
    };

    const res = await fetch(permissionsUrl, {
        method: 'GET',
        headers: requestHeaders
    });

    if (!res.ok) {
        throw new Error(`An error has occurred: ${res.status}`);
    }

    return;
}


callPermissionsUpdate()
