const getToken = (name) => {
  const match = document.cookie.match(new RegExp(`${name}=([^;]+)`));
  return match && match[1];
};

const jwtToken = getToken('APP_TOKEN');

export default jwtToken;
