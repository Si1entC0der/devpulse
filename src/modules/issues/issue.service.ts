import { StatusCodes } from "http-status-codes";
import pool from "../../config/database";
import AppError from "../../utils/AppError";

const createIssue = async (payload: any, reporter_id: number) => {
  const { title, description, type } = payload;

  if (!title || !description || !type) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Title, description and type are required",
    );
  }

  if (title.length > 150) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Title maximum length is 150 characters",
    );
  }

  if (description.length < 20) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Description minimum length is 20 characters",
    );
  }

  if (type !== "bug" && type !== "feature_request") {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Type must be bug or feature_request",
    );
  }

  const query = `
    INSERT INTO issues (title, description, type, status, reporter_id, created_at, updated_at)
    VALUES ($1, $2, $3, 'open', $4, NOW(), NOW())
    RETURNING *;
  `;

  const result = await pool.query(query, [
    title,
    description,
    type,
    reporter_id,
  ]);
  return result.rows[0];
};

const getAllIssues = async (query: any) => {
  let { sort, type, status } = query;

  let sql = "SELECT * FROM issues";
  let conditions = [];
  let values = [];

  if (type) {
    values.push(type);
    conditions.push(`type = $${values.length}`);
  }

  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }

  if (sort === "oldest") {
    sql += " ORDER BY created_at ASC";
  } else {
    sql += " ORDER BY created_at DESC";
  }

  const result = await pool.query(sql, values);
  const issues = result.rows;

  if (issues.length === 0) return [];

  // Fetch users without JOIN
  const reporterIds = [...new Set(issues.map((issue) => issue.reporter_id))];
  const placeholders = reporterIds.map((_, i) => `$${i + 1}`).join(",");
  const usersQuery = `SELECT id, name, role FROM users WHERE id IN (${placeholders})`;
  const usersResult = await pool.query(usersQuery, reporterIds);
  const usersMap = new Map();
  usersResult.rows.forEach((user) => usersMap.set(user.id, user));

  return issues.map((issue) => {
    const { reporter_id, created_at, updated_at, ...issueData } = issue;
    return {
      ...issueData,
      reporter: usersMap.get(reporter_id) || null,
      created_at,
      updated_at,
    };
  });
};

const getSingleIssue = async (id: number) => {
  const query = `SELECT * FROM issues WHERE id = $1`;
  const result = await pool.query(query, [id]);
  const issue = result.rows[0];

  if (!issue) {
    throw new AppError(StatusCodes.NOT_FOUND, "Issue not found");
  }

  const usersQuery = `SELECT id, name, role FROM users WHERE id = $1`;
  const usersResult = await pool.query(usersQuery, [issue.reporter_id]);

  const { reporter_id, created_at, updated_at, ...issueData } = issue;
  return {
    ...issueData,
    reporter: usersResult.rows[0] || null,
    created_at,
    updated_at,
  };
};

const updateIssue = async (id: number, payload: any, expectedUser: any) => {
  // First get the issue
  const issueQuery = `SELECT * FROM issues WHERE id = $1`;
  const issueResult = await pool.query(issueQuery, [id]);
  const issue = issueResult.rows[0];

  if (!issue) {
    throw new AppError(StatusCodes.NOT_FOUND, "Issue not found");
  }

  // Check permissions:
  // Maintainer (any issue) OR Contributor (own issue, only if status is open)
  if (expectedUser.role === "contributor") {
    if (issue.reporter_id !== expectedUser.id) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        "You can only update your own issues",
      );
    }
    if (issue.status !== "open") {
      throw new AppError(
        StatusCodes.CONFLICT,
        "Contributors can only edit open issues",
      );
    }
  }

  // Fields allowed to update
  const { title, description, type, status } = payload;

  let updates = [];
  let values = [];

  if (title !== undefined) {
    if (title.length > 150)
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Title maximum length is 150 characters",
      );
    values.push(title);
    updates.push(`title = $${values.length}`);
  }

  if (description !== undefined) {
    if (description.length < 20)
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Description minimum length is 20 characters",
      );
    values.push(description);
    updates.push(`description = $${values.length}`);
  }

  if (type !== undefined) {
    if (type !== "bug" && type !== "feature_request")
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Type must be bug or feature_request",
      );
    values.push(type);
    updates.push(`type = $${values.length}`);
  }

  if (status !== undefined) {
    if (expectedUser.role === "contributor" && payload.status !== undefined) {
      // "Change issue workflow status independently" is maintainer only - but strictness here
      // "maintainer: Change issue workflow status independently"
      // Wait, does contributor can change status? The spec says Maintainer allows "Change issue workflow status independently". The contributor can "Create new issues". Update says "Update issue title, description, or type". Let's restrict contributor from updating status.
      if (status !== issue.status) {
        throw new AppError(
          StatusCodes.FORBIDDEN,
          "Contributors cannot update issue status",
        );
      }
    } else {
      if (
        status !== "open" &&
        status !== "in_progress" &&
        status !== "resolved"
      ) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Invalid status");
      }
      values.push(status);
      updates.push(`status = $${values.length}`);
    }
  }

  if (updates.length === 0) {
    return issue; // nothing to update
  }

  values.push(id);
  const updateQuery = `
    UPDATE issues
    SET ${updates.join(", ")}, updated_at = NOW()
    WHERE id = $${values.length}
    RETURNING *;
  `;

  const result = await pool.query(updateQuery, values);
  return result.rows[0];
};

const deleteIssue = async (id: number) => {
  const issueQuery = `SELECT * FROM issues WHERE id = $1`;
  const issueResult = await pool.query(issueQuery, [id]);
  const issue = issueResult.rows[0];

  if (!issue) {
    throw new AppError(StatusCodes.NOT_FOUND, "Issue not found");
  }

  const query = `DELETE FROM issues WHERE id = $1`;
  await pool.query(query, [id]);
};

export const IssueService = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue,
};
