const calculateDistance = async (coords) => {
  const getDistance = async () => {
    // This code runs synchronously. We're waiting for each chunk to be send.
    // A better approach is to use Promise.all() and send multiple chunks in parallel.
        console.log('meters')
  };
  await getDistance();
};
module.exports = calculateDistance;

