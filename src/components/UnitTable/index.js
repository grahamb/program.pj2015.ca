"use strict";

import React from 'react';
import FixedDataTable from 'fixed-data-table';
import $ from 'jquery';
import moment from 'moment';

const PropTypes = {React};

const Column = FixedDataTable.Column;
const Table = FixedDataTable.Table;

const SortTypes = {
  ASC: 'ASC',
  DESC: 'DESC',
};

const UnitTable = React.createClass({

  getInitialState() {
    return {
      rows: this.props.units,
      filteredRows: null,
      filterBy: null,
      sortBy: 'unit_number',
      sortDir: null
    };
  },

  componentWillMount() {
    this._filterRowsBy(this.state.filterBy);
  },

  _sortRowsBy(cellDataKey) {
      var sortDir = this.state.sortDir;
      var sortBy = cellDataKey;
      if (sortBy === this.state.sortBy) {
        sortDir = this.state.sortDir === SortTypes.ASC ? SortTypes.DESC : SortTypes.ASC;
      } else {
        sortDir = SortTypes.DESC;
      }

      var rows = this.state.filteredRows.slice();
      rows.sort((a, b) => {
        var sortVal = 0;
        if (a[sortBy] > b[sortBy]) {
          sortVal = 1;
        }
        if (a[sortBy] < b[sortBy]) {
          sortVal = -1;
        }

        if (sortDir === SortTypes.DESC) {
          sortVal = sortVal * -1;
        }

        return sortVal;
      });

      this.setState({
        filteredRows: rows,
        sortBy,
        sortDir,
      });
    },

  _filterRowsBy(filterBy) {

    var rows = this.state.rows.slice();
    var filteredRows = filterBy ? rows.filter(function(row){
      return row['unit_name'].toLowerCase().indexOf(filterBy.toLowerCase()) >= 0 || row['unit_number'].toLowerCase().indexOf(filterBy.toLowerCase()) >= 0
    }) : rows;

    this.setState({
      filteredRows,
      filterBy,
    })
  },

  _rowGetter(rowIndex) {
    return this.state.filteredRows[rowIndex];
  },

  _onFilterChange(e) {
    this._filterRowsBy(e.target.value);
  },

  _renderHeader(label, cellDataKey) {
    return (
      <span className="hover-pointer" onClick={this._sortRowsBy.bind(null, cellDataKey)}>{label}</span>
    );
  },


  render() {
    var sortDirArrow = '';

    if (this.state.sortDir !== null){
      sortDirArrow = this.state.sortDir === SortTypes.DESC ? ' ↓' : ' ↑';
    }

    const renderLink = (cellData, cellDataKey, rowData, rowIndex, columnData, width) => {
      return <a href={`/units/${rowData.id}`}>{cellData}</a>;
    };

    const renderPaymentDate = (cellData, cellDataKey, rowData, rowIndex, columnData, width) => {
      return (cellData ? <span>{ moment(cellData).format('YYYY/MM/DD') }</span> : <span>Not Received</span>);
    };

    return (
      <div>

        <input
          autoFocus="autoFocus"
          type="text"
          onChange={this._onFilterChange}
          placeholder='Filter by Unit Number or Unit Name'
        />

        <Table
          rowHeight={50}
          rowGetter={this._rowGetter}
          rowsCount={this.state.filteredRows.length}
          width={this.props.tableWidth}
          maxHeight={this.props.tableHeight}
          scrollTop={this.props.top}
          scrollLeft={this.props.left}
          headerHeight={50}>
          <Column
            headerRenderer={this._renderHeader}
            cellRenderer={renderLink}
            dataKey='unit_number'
            fixed={true}
            label={'Unit Number' + (this.state.sortBy === 'unit_number' ? sortDirArrow : '')}
            width={150}
          />
          <Column
            headerRenderer={this._renderHeader}
            dataKey='unit_name'
            fixed={true}
            label={'Unit Name' + (this.state.sortBy === 'unit_name' ? sortDirArrow : '')}
            width={437}
          />
          <Column
            headerRenderer={this._renderHeader}
            dataKey='number_of_youth'
            fixed={true}
            label={'Youth' + (this.state.sortBy === 'number_of_youth' ? sortDirArrow : '')}
            width={100}
          />
          <Column
            headerRenderer={this._renderHeader}
            dataKey='number_of_leaders'
            fixed={true}
            label={'Leaders' + (this.state.sortBy === 'number_of_leaders' ? sortDirArrow : '')}
            width={100}
          />
          <Column
            headerRenderer={this._renderHeader}
            dataKey='total_participants'
            fixed={true}
            label={'Total' + (this.state.sortBy === 'total_participants' ? sortDirArrow : '')}
            width={100}
          />
          <Column
            cellRenderer={renderPaymentDate}
            fixed={true}
            label='Payment Date'
            dataKey='final_payment_date'
            width={200}
          />
        </Table>
      </div>
    )
  },
})


export default UnitTable;
