const getCookie = (name) => {
  const match = document.cookie.match(new RegExp(`${name}=([^;]+)`));
  return match && match[1];
};

const userRole = parseInt(getCookie('CSO_ROLE'), 10) || 2;

export default userRole;
