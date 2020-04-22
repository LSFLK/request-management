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
import { AccountSwitchRequestParams, OIDCRequestParamsInterface } from "../models/oidc-request-params";
import { TokenResponseInterface } from "../models/token-response";
/**
 * Checks whether authorization code present in the request.
 *
 * @returns {boolean} true if authorization code is present.
 */
export declare const hasAuthorizationCode: () => boolean;
/**
 * Send authorization request.
 *
 * @param {OIDCRequestParamsInterface} requestParams request parameters required for authorization request.
 */
export declare const sendAuthorizationRequest: (requestParams: OIDCRequestParamsInterface) => boolean | Promise<never>;
/**
 * Send token request.
 *
 * @param {OIDCRequestParamsInterface} requestParams request parameters required for token request.
 * @returns {Promise<TokenResponseInterface>} token response data or error.
 */
export declare const sendTokenRequest: (requestParams: OIDCRequestParamsInterface) => Promise<TokenResponseInterface>;
/**
 * Send refresh token request.
 *
 * @param {OIDCRequestParamsInterface} requestParams request parameters required for token request.
 * @param {string} refreshToken
 * @returns {Promise<TokenResponseInterface>} refresh token response data or error.
 */
export declare const sendRefreshTokenRequest: (requestParams: OIDCRequestParamsInterface, refreshToken: string) => Promise<TokenResponseInterface>;
/**
 * Send revoke token request.
 *
 * @param {OIDCRequestParamsInterface} requestParams request parameters required for revoke token request.
 * @param {string} accessToken access token
 * @returns {any}
 */
export declare const sendRevokeTokenRequest: (requestParams: OIDCRequestParamsInterface, accessToken: string) => Promise<any>;
/**
 * Get user image from gravatar.com.
 *
 * @param emailAddress email address received authenticated user.
 * @returns {string} gravatar image path.
 */
export declare const getGravatar: (emailAddress: string) => string;
/**
 * Get authenticated user from the id_token.
 *
 * @param idToken id_token received from the IdP.
 * @returns {AuthenticatedUserInterface} authenticated user.
 */
export declare const getAuthenticatedUser: (idToken: string) => AuthenticatedUserInterface;
/**
 * Send account switch request.
 *
 * @param {AccountSwitchRequestParams} requestParams request parameters required for the account switch request.
 * @param {string} clientHost client host.
 * @returns {Promise<TokenResponseInterface>} token response data or error.
 */
export declare const sendAccountSwitchRequest: (requestParams: AccountSwitchRequestParams) => Promise<TokenResponseInterface>;
