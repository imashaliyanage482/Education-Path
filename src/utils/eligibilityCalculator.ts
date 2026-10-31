import { Course, EligibilityEvaluation, EligibilityStatus, UserQualificationInput } from '../types';

export const evaluateEligibility = (
  course: Course,
  userInput: UserQualificationInput
): EligibilityEvaluation => {
  const metRequirements: string[] = [];
  const missingRequirements: string[] = [];
  const recommendedSteps: string[] = [];

  const req = course.entryRequirements;

  // 1. Evaluate O/L Requirements
  if (req.olRequirement) {
    if (!userInput.hasOL) {
      missingRequirements.push('G.C.E. O/L Examination passes are required.');
      recommendedSteps.push('Complete your G.C.E. O/L examination or equivalent international GCSEs.');
    } else {
      metRequirements.push('Completed G.C.E. O/L Examination.');
      
      // Check English
      if (req.olRequirement.english && userInput.olEnglishGrade) {
        const requiredEnglishCredit = req.olRequirement.english.toLowerCase().includes('credit') || req.olRequirement.english.toLowerCase().includes('c');
        const userHasEnglishCredit = ['A', 'B', 'C'].includes(userInput.olEnglishGrade.toUpperCase());
        if (requiredEnglishCredit && !userHasEnglishCredit) {
          missingRequirements.push(`Requires at least Credit (C) in English (You entered: ${userInput.olEnglishGrade}).`);
          recommendedSteps.push('Consider retaking O/L English or sitting for an approved English proficiency test (e.g. IELTS/Pearson).');
        } else {
          metRequirements.push(`English requirement met (${userInput.olEnglishGrade}).`);
        }
      }

      // Check Maths
      if (req.olRequirement.mathematics && userInput.olMathsGrade) {
        const requiredMathsCredit = req.olRequirement.mathematics.toLowerCase().includes('credit') || req.olRequirement.mathematics.toLowerCase().includes('c');
        const userHasMathsCredit = ['A', 'B', 'C'].includes(userInput.olMathsGrade.toUpperCase());
        if (requiredMathsCredit && !userHasMathsCredit) {
          missingRequirements.push(`Requires at least Credit (C) in Mathematics (You entered: ${userInput.olMathsGrade}).`);
          recommendedSteps.push('Enroll in an introductory mathematics bridge programme or retake O/L Mathematics.');
        } else {
          metRequirements.push(`Mathematics requirement met (${userInput.olMathsGrade}).`);
        }
      }
    }
  }

  // 2. Evaluate A/L or Higher Level Requirements
  if (req.alRequirement) {
    const minPasses = req.alRequirement.minimumPasses || 2;
    const userALPasses = userInput.alPassCount || 0;

    const hasMatchingHigherQual = userInput.higherQualifications.some((q) =>
      ['Foundation', 'Diploma', 'Higher Diploma', 'HND', 'Degree'].includes(q)
    );

    if (userInput.hasAL && userALPasses >= minPasses) {
      // Stream check
      if (req.alRequirement.stream && req.alRequirement.stream !== 'Any') {
        if (userInput.alStream && userInput.alStream.toLowerCase() === req.alRequirement.stream.toLowerCase()) {
          metRequirements.push(`G.C.E. A/L requirement met: ${userALPasses} passes in ${userInput.alStream} stream.`);
        } else if (userInput.alStream) {
          missingRequirements.push(`Requires A/L ${req.alRequirement.stream} stream (You selected ${userInput.alStream}).`);
          recommendedSteps.push(`Explore alternative foundation or bridge diplomas accepting ${userInput.alStream} stream students.`);
        } else {
          metRequirements.push(`G.C.E. A/L completed with ${userALPasses} passes.`);
        }
      } else {
        metRequirements.push(`G.C.E. A/L requirement met (${userALPasses} passes).`);
      }
    } else if (hasMatchingHigherQual) {
      metRequirements.push('Alternative route: Pre-university Foundation or Diploma credential presented.');
    } else if (!userInput.hasAL && course.qualificationType === 'Degree') {
      missingRequirements.push(`Requires minimum ${minPasses} passes in G.C.E. A/L or a recognized Foundation Certificate.`);
      recommendedSteps.push('Consider enrolling in a 1-year Foundation Certificate in ' + course.studyField + ' for direct degree progression.');
    }
  }

  // Determine Overall Status
  let status: EligibilityStatus = 'Eligible';
  let statusSinhala = 'සුදුසුකම් සම්පූර්ණයි – අවශ්‍යතා සපුරා ඇති බව පෙනේ';
  let summary = 'Based on your submitted qualifications, you appear to meet the entry criteria for this course.';
  let summarySinhala = 'ඔබ ඉදිරිපත් කළ සුදුසුකම් අනුව මෙම පාඨමාලාව සඳහා වන මූලික ප්‍රවේශ අවශ්‍යතා ඔබ සපුරා ඇති බව පෙනේ.';
  let matchScore = 95;

  if (missingRequirements.length === 0 && metRequirements.length === 0) {
    status = 'More Information Needed';
    statusSinhala = 'වැඩිදුර තොරතුරු අවශ්‍යයි';
    summary = 'Please provide your specific O/L and A/L grades to complete an accurate verification.';
    summarySinhala = 'නිවැරදි ඇගයීමක් සිදුකිරීම සඳහා කරුණාකර ඔබගේ සාමාන්‍ය පෙළ සහ උසස් පෙළ ශ්‍රේණි ඇතුළත් කරන්න.';
    matchScore = 50;
  } else if (missingRequirements.length > 0) {
    if (userInput.hasOL && !userInput.hasAL && course.qualificationType === 'Degree') {
      status = 'Future Pathway';
      statusSinhala = 'අනාගත මාවතක් ලෙස සුදුසුයි';
      summary = 'You currently hold O/L qualifications. You can reach this Degree by completing a 1-year Foundation or 2-year A/L pathway first.';
      summarySinhala = 'ඔබ සතුව සාමාන්‍ය පෙළ සුදුසුකම් ඇත. වසරක පදනම් පාඨමාලාවක් (Foundation) හෝ උසස් පෙළ හැදෑරීමෙන් පසු මෙම උපාධියට පිවිසිය හැක.';
      matchScore = 65;
    } else {
      status = 'Additional Qualifications Required';
      statusSinhala = 'අමතර සුදුසුකම් අවශ්‍ය වේ';
      summary = 'You do not currently satisfy all published entry criteria for direct admission to this programme.';
      summarySinhala = 'මෙම පාඨමාලාවට සෘජුව ඇතුළත් වීම සඳහා වන සියලු ප්‍රකාශිත අවශ්‍යතා දැනට සපුරා නොමැත.';
      matchScore = 35;
    }
  }

  if (recommendedSteps.length === 0) {
    recommendedSteps.push('Proceed to the official institution website to verify upcoming intake application deadlines.');
    recommendedSteps.push('Prepare certified copies of your educational certificates.');
  }

  return {
    status,
    statusSinhala,
    matchScore,
    summary,
    summarySinhala,
    metRequirements,
    missingRequirements,
    recommendedSteps,
    disclaimer: 'This evaluation is an automated guidance assessment based on published institutional criteria. Final admission decisions are made exclusively by the awarding institution.',
  };
};
