function warningMessage(title, reason){
  return {
    embeds: [{
      title: title,
      description: reason,
      color: "YELLOW"
    }]
  }
}
