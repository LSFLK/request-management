import handler from './apiHandler'

export const getOrganization = async (organizationId) => {
    return handler.get(`/organizations/${organizationId}`);
}
