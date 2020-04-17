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
/// <reference types="crypto-js" />
import { JWKInterface } from "../models/crypto";
/**
 * Generate email hash.
 *
 * @returns {string} hashed email address.
 */
export declare const getEmailHash: (emailAddress: string) => import("crypto-js").WordArray;
/**
 * Get URL encoded string.
 *
 * @param {CryptoJS.WordArray} value.
 * @returns {string} base 64 url encoded value.
 */
export declare const base64URLEncode: (value: import("crypto-js").WordArray) => string;
/**
 * Generate code verifier.
 *
 * @returns {string} code verifier.
 */
export declare const getCodeVerifier: () => string;
/**
 * Derive code challenge from the code verifier.
 *
 * @param {string} verifier.
 * @returns {string} code challenge.
 */
export declare const getCodeChallenge: (verifier: string) => string;
/**
 * Get the supported signing algorithms for the id_token.
 *
 * @returns {string[]} array of supported algorithms.
 */
export declare const getSupportedSignatureAlgorithms: () => string[];
/**
 * Get JWK used for the id_token
 *
 * @param {string} jwtHeader header of the id_token.
 * @param {JWKInterface[]} keys jwks response.
 * @returns {any} public key.
 */
export declare const getJWKForTheIdToken: (jwtHeader: string, keys: JWKInterface[]) => any;
/**
 * Verify id token.
 *
 * @param idToken id_token received from the IdP.
 * @param jwk public key used for signing.
 * @param {string} clientID app identification.
 * @param {string} issuer id_token issuer.
 * @returns {any} whether the id_token is valid.
 */
export declare const isValidIdToken: (idToken: any, jwk: any, clientID: string, issuer: string) => any;
