/// Extracts imports from typescript and javascript files.
use std::{convert, env::args, io};

use extract_imports::{extract_imports, ExtractImportsError};

#[allow(dead_code)]
#[derive(Debug)]
enum ExtractImportsCmdError {
    ExtractImportsLibError(ExtractImportsError),
    Io(io::Error),
    String(String),
}

impl convert::From<&str> for ExtractImportsCmdError {
    fn from(error: &str) -> Self {
        Self::String(error.into())
    }
}

impl convert::From<String> for ExtractImportsCmdError {
    fn from(error: String) -> Self {
        Self::String(error)
    }
}

impl convert::From<io::Error> for ExtractImportsCmdError {
    fn from(error: io::Error) -> Self {
        Self::Io(error)
    }
}

impl convert::From<ExtractImportsError> for ExtractImportsCmdError {
    fn from(error: ExtractImportsError) -> Self {
        Self::ExtractImportsLibError(error)
    }
}

// below is due to passing the output of `println!` to Result::Ok -- but this
// is intentional on my part.
#[allow(clippy::unit_arg)]
fn act() -> Result<(), ExtractImportsCmdError> {
    Result::Ok(println!(
        "{}",
        extract_imports(args().nth(1).ok_or("Please specify a target!")?)?.join("\n")
    ))
}

fn main() {
    act().unwrap()
}
