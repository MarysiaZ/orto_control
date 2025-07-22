const jsPsych = initJsPsych();
let timeline = [];

// Intro screen with button "ROZPOCZNIJ TEST"
timeline.push({
  type: jsPsychHtmlButtonResponse,
  stimulus: '<p style="font-size: 32px;">ROZPOCZNIJ TEST</p>',
  choices: ['Start']
});

Papa.parse('words_cleaned.csv', {
  download: true,
  header: true,
  complete: function(results) {
    let raw = results.data;

    let trials = raw.filter(trial => {
      const words = [trial.Word1, trial.Word2, trial.Word3];
      const allWordsValid = words.every(w => typeof w === 'string' && w.trim().length > 0);
      const correctIndex = parseInt(trial.Correct) - 1;
      const validCorrect = ['1', '2', '3'].includes(String(trial.Correct).trim());
      return allWordsValid && validCorrect && typeof words[correctIndex] !== 'undefined';
    });

    for (let i = 0; i < trials.length; i++) {
      let trial = trials[i];
      let choices = [trial.Word1, trial.Word2, trial.Word3];
      let correctIndex = parseInt(trial.Correct) - 1;
      let correctWord = choices[correctIndex];

      // Safety check
      if (
        choices.length !== 3 ||
        choices.some(w => typeof w !== 'string' || w.trim() === '') ||
        typeof correctWord === 'undefined'
      ) {
        console.warn("Skipping invalid trial at index", i, trial);
        continue;
      }

      timeline.push({
        type: jsPsychHtmlButtonResponse,
        stimulus: '<div style="font-size: 48px;">&nbsp;</div>',
        choices: choices.map(word => `<span style="font-size: 48px;">${word}</span>`),
        data: {
          correct: correctWord
        },
        on_finish: function(data){
          data.response_word = choices[data.response];
          data.correct_response = data.response_word === data.correct;
        }
      });
    }

    // Final screen
    timeline.push({
      type: jsPsychHtmlButtonResponse,
      stimulus: '<p style="font-size: 32px;">DZIĘKUJEMY!</p>',
      choices: ['Pobierz wyniki'],
      on_finish: function() {
        jsPsych.data.get().localSave('csv', 'word_task_results.csv');
      }
    });

    jsPsych.run(timeline);
  }
});
