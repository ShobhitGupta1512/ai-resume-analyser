export const calculateATSScore = (skills) => {

  const expectedSkills = [
    "javascript",
    "react",
    "node",
    "express",
    "mongodb",
    "html",
    "css",
    "git",
    "docker",
    "aws"
  ];

  let matchedSkills = skills.filter(skill =>
    expectedSkills.includes(skill)
  );

  let score = (matchedSkills.length / expectedSkills.length) * 100;

  return Math.round(score);
};