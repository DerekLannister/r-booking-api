/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DefaultService {
    /**
     * Find available restaurants
     * @param dinerIds Array of diner IDs
     * @param time Desired reservation time
     * @returns any List of available restaurants
     * @throws ApiError
     */
    public static getAvailableRestaurants(
        dinerIds: Array<string>,
        time: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/restaurants/available',
            query: {
                'dinerIds': dinerIds,
                'time': time,
            },
            errors: {
                400: `Missing required parameters`,
                500: `Server error`,
            },
        });
    }
    /**
     * Create a reservation
     * @param requestBody
     * @returns any Reservation created
     * @throws ApiError
     */
    public static createReservation(
        requestBody: {
            tableTopId: string;
            dinerIds: Array<string>;
            startTime: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/reservations',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Missing required parameters`,
                500: `Server error`,
            },
        });
    }
    /**
     * Delete a reservation
     * @param reservationId
     * @returns void
     * @throws ApiError
     */
    public static deleteReservation(
        reservationId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/reservations/{reservationId}',
            path: {
                'reservationId': reservationId,
            },
            errors: {
                404: `Reservation not found`,
                500: `Server error`,
            },
        });
    }
}
