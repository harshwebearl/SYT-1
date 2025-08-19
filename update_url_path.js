async function update_path(foldername, data) {
  if (!data || data.length === 0) {
    return null;
  }
  var updated_data;
  updated_data = "https://syt-i471.onrender.com/images/" + foldername + "/" + data;
  // console.log(updated_data);
  return updated_data;
}

module.exports = update_path;
