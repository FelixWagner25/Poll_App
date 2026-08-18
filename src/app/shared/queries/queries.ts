export const GET_SURVEY_RESULTS_QUERY = `id,
      name,
      description,
      category,
      endDate,
      participantsCount,
      questions (
        id,
        text,
        multipleAnswers,
        positionIndex,
        surveyId,
        answers (
          id,
          text,
          resultCount,
          positionIndex,
          questionId
        )
      )`;
