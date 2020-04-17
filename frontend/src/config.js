let API_BASE_URL = "http://localhost:8000";
let WEB_SOCKET_BASE_URL = "ws://127.0.0.1:8000"
let IDENTITY_SERVER_URL = "https://localhost:9443/";
let CLIENT_ID = "zaD9TmFtlFCVWkH4ny9uE6IVpQYa";

if (process.env.NODE_ENV === "production"){
    API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
    WEB_SOCKET_BASE_URL = process.env.REACT_APP_WEB_SOCKET_BASE_URL;
    IDENTITY_SERVER_URL = process.env.IDENTITY_SERVER_URL;
    CLIENT_ID = process.env.CLIENT_ID;
}

export { API_BASE_URL, WEB_SOCKET_BASE_URL,IDENTITY_SERVER_URL, CLIENT_ID };
