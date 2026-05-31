export const isUselessCommit = (message) => {
  const trashPatterns = [
    /^Merge (branch|pull request|remote-tracking branch)/i, //  Merge commits
    /^WIP:?(\s|-|$)/i,                                      //  Work in Progress (WIP, WIP:, WIP -)
    /^(chore|ci|build|test)(\(|:)/i,                        //  Conventional Commits
    /^(bump|update) version/i,                              //  upd version
    /^update (readme|docs|documentation)\.?$/i,             //  upd documentation
    /^typo(s)?\b/i,                                         //  upd typo
    /^\d+\.\d+\.\d+$/,                                      //  upd version numbers
    /^init(ial)?( commit)?$/i                               //  initial commit or init
  ];

  return trashPatterns.some(pattern => pattern.test(message.trim()));
};

export const filterCleanCommits = (commitsArray) => {
  return commitsArray.filter(commit => !isUselessCommit(commit.message));
};
