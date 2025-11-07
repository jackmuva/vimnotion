package models

type User struct {
	Email string
	Name  string
}

type DirectoryStructure struct {
	Email     string
	Structure string
}

type VnObject struct {
	Id         string
	Name       string
	IsFile     bool
	Contents   string
	UpdateDate string
}

type UserData struct {
	Username string
	Name     string
	Avatar   string
	Email    string
}

type DataResponse struct {
	Message    *string
	StatusCode int
	Data       *string
}

type ErrorMessage struct {
	Message    string
	StatusCode int
}
