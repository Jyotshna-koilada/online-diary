const date = new Date();
const options = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
};

const getDate = () => {
  return date.toLocaleString('en-US', options);
}

module.exports = getDate;
