import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  withStyles,
  TableFooter,
  TablePagination,
} from "@material-ui/core";
import { withRouter } from "react-router";
import moment from "moment";
import { useIntl } from "react-intl";

const CustomTableCell = withRouter(
  withStyles((theme) => ({
    body: {
      // padding: "3px 8px",
      fontSize: "14px",
      textAlign: 'center',
      "& p.description": {
        overflow: "hidden",
        textOverflow: "ellipsis",
        display: "-webkit-box",
        lineHeight: "16px",
        maxHeight: "32px",
        "-webkit-line-clamp": 2,
        "-webkit-box-orient": "vertical",
      },
    },
      head:{
          fontSize: "16px",
      }
  }))(TableCell)
);

const styles = (theme) => ({
  root: {
    width: "100%",
    overflowX: "auto",
  },
  table: {
    minWidth: 700,
    tableCellStyles: {
      padding: "10px 10px",
    },
  },
  tableHeader: {
    padding: "10px 10px",
  },
  row: {
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.background.default,
    },
    cursor: "pointer",
  },
  root: {
    width: "100%",
    marginTop: theme.spacing.unit * 3,
    overflowX: "auto",
  },
  table: {
    minWidth: 700,
    padding: "10px 10px",
  },
  row: {
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.background.default,
    },
    cursor: "pointer",
  },
  root: {
    display: "flex",
    flexWrap: "wrap",
    padding: "24px 31px",
  },
  formControl: {
    margin: theme.spacing.unit * 2,
    minWidth: 240,
  },
  buttonContainer: {
    margin: theme.spacing.unit * 2,
    minWidth: 300,
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  selectEmpty: {
    marginTop: theme.spacing.unit * 1,
  },
  datePicker: {},
  separator: {
    height: "10px",
  },
});

function IncidentList({
  classes,
  incidentType,
  incidents,
  pageNumber,
  count,
  handleRowClick,
  handlePageChange,
}) {
  const { channels, districts, categories } = useSelector((state) => state.shared);
  const { formatMessage: f } = useIntl();

  return (
    <Table className={classes.table}>
      <colgroup>
      <col style={{ width: "2%" }} />
        <col style={{ width: "5%" }} />
        <col style={{ width: "5%" }} />
        <col style={{ width: "48%" }} />
        <col style={{ width: "5%" }} />
        <col style={{ width: "30%" }} />
        <col style={{ width: "5%" }} />
        <col style={{ width: "5%" }} />
        <col style={{ width: "5%" }} />
      </colgroup>
      <TableHead>
        <TableRow>
          <CustomTableCell align="center">{f({id: "request.management.home.incidents.list.refid"})}</CustomTableCell>
          <CustomTableCell align="center">{f({id: "request.management.home.incidents.list.city"})}</CustomTableCell>
          <CustomTableCell align="center">{f({id: "request.management.home.incidents.list.reporter"})}</CustomTableCell>
          <CustomTableCell align="center">{f({id: "request.management.home.incidents.list.date"})}</CustomTableCell>
          {/* <CustomTableCell align="center">{f({id: "request.management.incident.create.location.district"})}</CustomTableCell> */}
          <CustomTableCell align="center">{f({id: "request.management.home.incidents.list.channel"})}</CustomTableCell>
          <CustomTableCell align="center">{f({id: "request.management.home.incidents.list.category"})}</CustomTableCell>
          <CustomTableCell align="center">{f({id: "request.management.home.incidents.list.status"})}</CustomTableCell>
          <CustomTableCell align="center">{f({id: "request.management.home.incidents.list.severity"})}</CustomTableCell>
          <CustomTableCell align="center">{f({id: "request.management.home.incidents.list.response_time"})}</CustomTableCell>
          {/* <CustomTableCell align="center">{f({id: "request.management.home.incidents.list.description"})}</CustomTableCell> */}
          {/* <CustomTableCell align="center">Final Resolution</CustomTableCell> */}
        </TableRow>
      </TableHead>
      <TableBody>
        {incidents.allIds.map((id) => {
          const row = incidents.byIds[id];

          return (
            <TableRow
              onClick={() => handleRowClick(row.id)}
              hover
              className={classes.row}
              key={row.id}
              style={(row.currentStatus==="ACTION_TAKEN" ||row.currentStatus==="INFORMATION_PROVIDED"||row.currentStatus==="VERIFIED") ? {backgroundColor:"rgba(0,255,0,0.2)"}:{}}
            >
              <CustomTableCell align="left">
                <p>{row.refId}</p>
              </CustomTableCell>
              <CustomTableCell align="center">
                <p>{row.city}</p>
              </CustomTableCell>
              <CustomTableCell align="center">
              <p>{row.reporterName}</p>
            </CustomTableCell>
              <CustomTableCell align="left">
                <p>{moment(row.createdDate).format("YYYY-MM-DD  h:mm a")}</p>
              </CustomTableCell>
              {/* <CustomTableCell align="center">
                <p>{districts.byCode[row.district] && districts.byCode[row.district]["name"]}</p>
              </CustomTableCell> */}
              <CustomTableCell scope="center">
              <p>
                {channels.map((value, index) =>
                  value.id == row.infoChannel ? value.name : null
                )}
              </p>
            </CustomTableCell>
            <CustomTableCell align="left">
                <p>
                  {categories.map((value, index) =>
                    value.id == row.category ? value.sub_category : null
                  )}
                </p>
              </CustomTableCell>
              <CustomTableCell align="center">
                <p>{row.currentStatus}</p>
              </CustomTableCell>
            <CustomTableCell align="center">
                <p>{row.severity}</p>
            </CustomTableCell>
            <CustomTableCell align="center">
              <p>{row.response_time} h</p>
            </CustomTableCell>
              {/* <CustomTableCell>
                <p>
                  {row.description.length > 40
                    ? row.description.substr(0, 40) + ".."
                    : row.description}
                </p>
              </CustomTableCell> */}
              {/* <CustomTableCell align="center">
                    <p>{row.current_decision}</p>
                  </CustomTableCell> */}
            </TableRow>
          );
        })}
      </TableBody>
      <TableFooter>
        {/* {pagination && ( */}
        <TableRow>
          <TablePagination
            rowsPerPageOptions={[15]}
            colSpan={3}
            count={count}
            rowsPerPage={15}
            page={pageNumber}
            SelectProps={{
              inputProps: { "aria-label": "rows per page" },
              native: true,
            }}
            onChangePage={handlePageChange}
          />
        </TableRow>
        {/* )} */}
      </TableFooter>
    </Table>
  );
}

export default withStyles(styles, { withTheme: true })(IncidentList);
