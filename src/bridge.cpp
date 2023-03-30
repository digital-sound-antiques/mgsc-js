#include <cstdio>
#include <sstream>

#include "mgsc.h"

static void normalize_newline(std::istream &is, std::stringstream &ss)
{
	std::string buf;
	while (getline(is, buf))
	{
		ss << buf << "\r\n";
	}
}

extern "C" size_t MGSC_compile(char *mml, char *mgs, char *mes)
{
	std::stringstream is;
	is << mml;
	std::stringstream ss;
	normalize_newline(is, ss);

	std::stringstream log;
	MGSC *mgsc = new MGSC();
	mgsc->SetConsole(&std::cin, &log);
	std::stringstream os;
	mgsc->Compile(&ss, &os, 1);

	strcpy(mes, log.str().c_str());

	size_t size = os.str().size();
	if (0 < size)
	{
		memcpy(mgs, os.str().c_str(), size);
	}

	delete mgsc;

	return size;
}