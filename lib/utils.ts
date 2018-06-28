export const registerTasks = function(profile, app, messenger) {
  //
}

/**
 * Get the profile for the current process
 * The profile contains a list that this process can work on
 * If there is no profile (ie the current process is not a worker process), this returns undefined
 */
export const getWorkerProfile = function (typeConfig) {
  const profileName = typeConfig.profile
  if (!profileName || !typeConfig.profiles[profileName]) {
    return { tasks: [] }
  }

  return typeConfig.profiles[profileName]
}
