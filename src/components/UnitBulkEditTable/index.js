import React from 'react';
import $ from 'jquery';
import UnitTableRow from './UnitTableRow';
import assign from 'object-assign';

const UnitBulkEditTable = React.createClass({

  getInitialState() {
    return {
      ready: false,
      units: []
    };
  },

  componentDidMount() {
    $.getJSON('/units', function(units) {
      this.setState({ ready: true, units: units });
    }.bind(this));
  },

  deleteUnit(id, i, event) {
    const deleteUrl = `/units/${id}/delete`;
    var state = assign({}, this.state);
    state.units.splice(i, 1);
    $.get(deleteUrl, function(status) {
      if (status === 'ok') {
        this.setState(state);
      }
    }.bind(this));
  },

  unitTableRows() {
    return this.state.units.map((unit, i) => {
      return (
        <UnitTableRow
          unit_id={unit.id}
          unit_number={unit.unit_number}
          unit_name={unit.unit_name}
          contact_first_name={unit.contact_first_name}
          contact_last_name={unit.contact_last_name}
          contact_email={unit.contact_email}
          number_of_youth={unit.number_of_youth}
          number_of_leaders={unit.number_of_leaders}
          program_selection={unit.ProgramSelection}
          deleteHandler={this.deleteUnit.bind(this, unit.id, i)}
          key={unit.unit_number}
        />
      );
    })
  },

  spinner() {
    var spinner = '';
    if (this.state.ready === false) {
      return (<center><img src="http://38.media.tumblr.com/e045f935a8b2f2e7544d70717b751c70/tumblr_mh7ycrdzLv1s3r70co1_500.gif" /></center>);
    }
    return spinner;
  },

  render() {
    return (
      <div>
        <table>
          <thead>
            <tr>
              <td>Unit #</td>
              <td>#Y</td>
              <td>#L</td>
              <td>Unit Name</td>
              <td>First Name</td>
              <td>Last Name</td>
              <td>Email</td>
              <td>Selection</td>
              <td></td>
            </tr>
          </thead>
          <tbody>
            {this.unitTableRows()}
          </tbody>
        </table>
        {this.spinner()}
      </div>
    );
  }

});

export default UnitBulkEditTable;