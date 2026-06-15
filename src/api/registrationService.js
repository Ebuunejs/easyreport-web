import api from './axios';

export const registerCompany = async (payload) => {
    const response = await api.post('/public/register-company', payload);
    console.log("Response: ",response);
    return response.data;
};
