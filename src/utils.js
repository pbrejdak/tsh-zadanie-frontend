export const DEFAULT_HEADERS = {
    'Content-Type': 'application/json'
};

export const makeRequest = (method, url, body = {}, headers = DEFAULT_HEADERS) => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.responseType = 'json';
        if (method !== 'GET')
            xhr.body = JSON.stringify(body);

        let isContentTypeHeaderPresent = false;
        if (headers) {
            for (const key in headers) {
                if (key && key.toLocaleLowerCase() === 'content-type') isContentTypeHeaderPresent = true;
                xhr.setRequestHeader(key, headers[key]);
            }
        }

        if (!isContentTypeHeaderPresent) {
            xhr.setRequestHeader('Content-Type', 'application/json');
        }

        xhr.onerror = (err) => reject(err);
        xhr.onabort = (err) => reject(err);
        xhr.onload = () => {
            const response = {
                status: xhr.status,
                statusText: xhr.statusText,
                url: xhr.url,
            }
            let body = 'response' in xhr ? xhr.response : xhr.responseText;
            body = typeof body === 'string' ? JSON.parse(body) : body;
            response.body = body;

            resolve(response);
        }

        xhr.send();
    });
};

export const parseHttpError = (response) => {
    const body = response.body || {};

    if (body.message) {
        return body.message;
    } else {
        return `${response.status}: ${response.statusText}`;
    }
}

export const formatDate = (date) => `${date.toLocaleDateString('en-US', { month: 'short' })} ${date.toLocaleDateString('en-US', { day: '2-digit' })}, ${date.toLocaleDateString('en-US', { year: 'numeric' })}`