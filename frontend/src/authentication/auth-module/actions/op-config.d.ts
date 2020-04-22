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
/**
 * Checks whether openid configuration initiated.
 *
 * @returns {boolean}
 */
export declare const isOPConfigInitiated: () => boolean;
/**
 * Set OAuth2 authorize endpoint.
 *
 * @param {string} authorizationEndpoint
 */
export declare const setAuthorizeEndpoint: (authorizationEndpoint: string) => void;
/**
 * Set OAuth2 token endpoint.
 *
 * @param {string} tokenEndpoint
 */
export declare const setTokenEndpoint: (tokenEndpoint: string) => void;
/**
 * Set OIDC end session endpoint.
 *
 * @param {string} endSessionEndpoint
 */
export declare const setEndSessionEndpoint: (endSessionEndpoint: string) => void;
/**
 * Set JWKS URI.
 *
 * @param jwksEndpoint
 */
export declare const setJwksUri: (jwksEndpoint: any) => void;
/**
 * Set OAuth2 revoke token endpoint.
 *
 * @param {string} revokeTokenEndpoint
 */
export declare const setRevokeTokenEndpoint: (revokeTokenEndpoint: string) => void;
/**
 * Set openid configuration initiated.
 */
export declare const setOPConfigInitiated: () => void;
/**
 * Set id_token issuer.
 *
 * @param issuer id_token issuer.
 */
export declare const setIssuer: (issuer: any) => void;
/**
 * Initialize openid provider configuration.
 *
 * @param {string} wellKnownEndpoint openid provider configuration.
 * @param {boolean} forceInit whether to initialize the configuration again.
 * @returns {Promise<any>} promise.
 */
export declare const initOPConfiguration: (wellKnownEndpoint: string, forceInit: boolean) => Promise<any>;
/**
 * Reset openid provider configuration.
 */
export declare const resetOPConfiguration: () => void;
/**
 * Get OAuth2 authorize endpoint.
 *
 * @returns {string|null}
 */
export declare const getAuthorizeEndpoint: () => string;
/**
 * Get OAuth2 token endpoint.
 *
 * @returns {string|null}
 */
export declare const getTokenEndpoint: () => string;
/**
 * Get OAuth2 revoke token endpoint.
 *
 * @returns {string|null}
 */
export declare const getRevokeTokenEndpoint: () => string;
/**
 * Get OIDC end session endpoint.
 *
 * @returns {string|null}
 */
export declare const getEndSessionEndpoint: () => string;
/**
 * Get JWKS URI.
 *
 * @returns {string|null}
 */
export declare const getJwksUri: () => string;
/**
 * Get authenticated user's username
 *
 * @returns {string|null}
 */
export declare const getUsername: () => string;
/**
 * Get tenant name
 *
 * @returns {any}
 */
export declare const getTenant: () => string | string[];
/**
 * Get id_token issuer.
 *
 * @returns {any}
 */
export declare const getIssuer: () => string;
/**
 * Checks whether openid configuration initiated is valid.
 *
 * @returns {boolean}
 */
export declare const isValidOPConfig: (tenant: any) => boolean;
