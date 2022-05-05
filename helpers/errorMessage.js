function errorMessage(reason) {
  return {
    embeds: [{
      title: "An error has occured",
      description: reason,
      color: "RED"
    }]
  }
}
