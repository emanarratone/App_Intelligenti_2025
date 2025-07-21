/**
 * rotta per isnerire pfp
 * @param formData
 * @returns {Promise<Response>}
 */
export async function addNewImgManager(formData) {
    return  await fetch('/users-route/uploadProfilePic', {
        method: 'POST',
        body: formData,
    });
}

/**
 * rotta per ottente la pfp
 * @returns {Promise<Response>}
 */
export async function getUsrPfp() {
    return  await fetch('/users-route/getProfilePic', {
        method: 'GET',
    });
}