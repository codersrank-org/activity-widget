const cache = {};

export const fetchData = (username, id) => {
  if (username && cache[username]) return Promise.resolve(cache[username]);
  if (id && cache[id]) return Promise.resolve(cache[id]);

  let endpoint = `https://grpcgateway.codersrank.io/candidate/activity/${username || id}`;
  if (id) endpoint += '?id=true';

  return fetch(endpoint, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (id) {
        cache[id] = data;
      } else {
        cache[username] = data;
      }
      return data;
    })
    .catch((err) => {
      // eslint-disable-next-line
      return Promise.reject(err);
    });
};
