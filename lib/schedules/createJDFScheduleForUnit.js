'use strict';

const models = require('../../models');
const moment = require('moment');
const Promise = models.sequelize.Promise;
require('es6-shim');

const chooseProgramPeriod = require('../scheduleHelpers/chooseProgramPeriod');
const findProgramPeriodsWithSpaceForUnit = require('../scheduleHelpers/findProgramPeriodsWithSpaceForUnit');
const getNumberOfParticipantsForProgramPeriod = require('../scheduleHelpers/getNumberOfParticipantsForProgramPeriod');
const getProgramPeriodsThatFitUnitSchedule = require('../scheduleHelpers/getProgramPeriodsThatFitUnitSchedule');
const unitHasProgramInSchedule = require('../scheduleHelpers/unitHasProgramInSchedule');
const unitHasPremiumActivity = require('../scheduleHelpers/unitHasPremiumActivity');

const schedulingAlgorithim = 'random';
const FREE_PERIOD = 25;
const TOWNSITE = 9;
const JDF = 3;
const MAX_PREMIUM_ACTIVITY = process.env['star'] || 1;

function findProgramPeriod(program, unit) {
  var how = schedulingAlgorithim; //(program.id === FREE_PERIOD) ? 'random' : schedulingAlgorithim;
  let periods = findProgramPeriodsWithSpaceForUnit(unit.total_participants, program.ProgramPeriods);
  periods = getProgramPeriodsThatFitUnitSchedule(unit, periods);
  if (!periods.length) {
    return null;
  }
  return chooseProgramPeriod(periods, how);
}

function getUnit(id) {
  return models.Unit.find({
    where: {id: id},
    include: [
      models.ProgramSelection,
      {
        model: models.ProgramPeriod,
        include: [{all:true}]
      }
    ]
  });
}

function getProgram(id) {
  return models.Program.find({
    where: { id: id },
    include: [ {model: models.ProgramPeriod, include: [{all:true}]}],
    order: [[ { model: models.ProgramPeriod }, 'start_at' ]]

  });
}

const createScheduleForUnit = Promise.coroutine(function* (u, i) {
  if (u.periodsAssigned === u.periodsToAssign) { console.log('unit schedule is full'); return u; }
  let unit = yield getUnit(u.unit_id);
  let unitScheduleIds = unit.ProgramPeriods.map(function(p) { return p.Program.id; });

  console.log(`Attempting to assign choice ${i} (${u.program_selection[i]}) for unit ${unit.id} - ${unit.unit_number} - ${unit.unit_name}`);


  // skip if program already in schedule
  // if (unitScheduleIds.indexOf(u.program_selection[i]) > -1) {
  if (unitScheduleIds.indexOf(u.program_selection[i]) > -1 && u.program_selection[i] !== FREE_PERIOD) {
    console.log(`Unit already has program ${u.program_selection[i]} in their schedule; skipping.`);
    return u;
  }

  let program = yield getProgram(u.program_selection[i]);


  if (program.premium_activity && unitHasPremiumActivity(unit.ProgramPeriods) >= MAX_PREMIUM_ACTIVITY && !process.env.multistar) {
    console.log('Unit already has a premium activity. Skipping %s.', program.name);
    return u;
  }

  console.log('Finding an available ProgramPeriod for %s', program.name);

  let period = findProgramPeriod(program, unit);

  if (period) {
    console.log(`  ${period.id}: ${period.start_at} - ${period.end_at}`);
    let result = yield unit.addProgramPeriod(period);
    u.periodsAssigned += period.spans_periods;

    const nextPeriodStartAt = moment(period.end_at).clone().hour(13).minute(30).toDate();
    const freePeriodToAssign = yield models.ProgramPeriod.find({
      where: {
        program_id: 25,
        start_at: nextPeriodStartAt
      }
    });
    yield unit.addProgramPeriod(freePeriodToAssign);
    u.periodsAssigned += freePeriodToAssign.spans_periods;

  } else {
    console.log('  No available ProgramPeriod found for %s', program.name);
  }
  return u
});

module.exports = createScheduleForUnit;

