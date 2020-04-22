/**
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { AuthenticatedUserInterface } from "../models/authenticated-user";
import { SessionInterface } from "../models/session";
import { TokenResponseInterface } from "../models/token-response";
/**
 * Remove parameter from session storage.
 *
 * @param {string} key.
 */
export declare const removeSessionParameter: (key: string) => void;
/**
 * Set parameter to session storage.
 *
 * @param {string} key.
 * @param value value.
 */
export declare const setSessionParameter: (key: string, value: string) => void;
/**
 * Get parameter from session storage.
 *
 * @param {string} key.
 * @returns {string | null} parameter value or null.
 */
export declare const getSessionParameter: (key: string) => string;
/**
 * End authenticated user session.
 */
export declare const endAuthenticatedSession: () => void;
/**
 * Initialize authenticated user session.
 *
 * @param {TokenResponseInterface} tokenResponse.
 * @param authenticatedUser authenticated user.
 */
export declare const initUserSession: (tokenResponse: TokenResponseInterface, authenticatedUser: AuthenticatedUserInterface) => void;
/**
 * Get the user session object.
 *
 * @returns {SessionInterface} session object.
 */
export declare const getAllSessionParameters: () => SessionInterface;
/**
 * Get access token.
 *
 * @returns {Promise<string>} access token.
 */
export declare const getAccessToken: () => Promise<string>;
